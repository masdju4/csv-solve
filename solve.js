const QUOTE = 34;
const COMMA = 44;
const LF = 10;
const CR = 13;

function decodeQuoted(text, from, to) {
  let out = '';
  let seg = from;
  let k = from;
  while (k < to) {
    const c = text.charCodeAt(k);
    if (c === CR) {
      out += text.slice(seg, k);
      out += '\n';
      if (k + 1 < to && text.charCodeAt(k + 1) === LF) k++;
      k++;
      seg = k;
    } else if (c === QUOTE) {
      out += text.slice(seg, k);
      out += '"';
      k += 2;
      seg = k;
    } else {
      k++;
    }
  }
  return out + text.slice(seg, to);
}

export function run(input) {
  const text = input.text;
  const len = text.length;
  const header = input.header === true;
  const errors = [];
  const rows = [];
  let columns = null;
  let width = -1;
  let rowIndex = 0;
  let firstRecord = true;

  let i = 0;
  if (len > 0 && text.charCodeAt(0) === 0xfeff) i = 1;
  let line = 1;

  while (i < len) {
    const recLine = line;
    const isHeader = header && firstRecord;
    const recRow = isHeader ? null : rowIndex;
    const fields = [];
    let touched = false;

    fieldLoop: while (true) {
      if (i >= len) {
        if (touched) fields.push('');
        break fieldLoop;
      }
      const c0 = text.charCodeAt(i);

      if (c0 === QUOTE) {
        touched = true;
        let j = i + 1;
        let closing = -1;
        let sawDbl = false;
        while (j < len) {
          const nq = text.indexOf('"', j);
          if (nq === -1) break;
          if (nq + 1 < len && text.charCodeAt(nq + 1) === QUOTE) {
            sawDbl = true;
            j = nq + 2;
            continue;
          }
          closing = nq;
          break;
        }

        if (closing < 0) {
          errors.push({ code: 'unterminated_quote', line: recLine, row: recRow });
        } else {
          let qlines = 0;
          let sawCR = false;
          let k = i + 1;
          let idx = text.indexOf('\n', k);
          while (idx !== -1 && idx < closing) {
            qlines++;
            idx = text.indexOf('\n', idx + 1);
          }
          k = i + 1;
          idx = text.indexOf('\r', k);
          while (idx !== -1 && idx < closing) {
            sawCR = true;
            if (!(idx + 1 < closing && text.charCodeAt(idx + 1) === LF)) qlines++;
            idx = text.indexOf('\r', idx + 1);
          }
          let value;
          if (!sawDbl && !sawCR) value = text.slice(i + 1, closing);
          else value = decodeQuoted(text, i + 1, closing);
          line += qlines;
          i = closing + 1;

          let junk = '';
          let jt = 0;
          while (i < len) {
            const cc = text.charCodeAt(i);
            if (cc === COMMA) {
              jt = 1;
              break;
            }
            if (cc === LF) {
              jt = 2;
              break;
            }
            if (cc === CR) {
              if (i + 1 < len && text.charCodeAt(i + 1) === LF) {
                jt = 2;
                break;
              }
              errors.push({ code: 'stray_cr', line: recLine, row: recRow });
              i++;
              continue;
            }
            junk += text[i];
            i++;
          }
          if (junk.length > 0) {
            errors.push({ code: 'quote_junk', line: recLine, row: recRow });
            value += junk;
          }
          fields.push(value);
          if (jt === 1) {
            i++;
            continue fieldLoop;
          }
          if (jt === 2) {
            i += text.charCodeAt(i) === CR ? 2 : 1;
            line++;
          }
          break fieldLoop;
        }
      } else if (c0 === COMMA) {
        fields.push('');
        touched = true;
        i++;
        continue fieldLoop;
      } else if (c0 === LF) {
        if (touched) fields.push('');
        i++;
        line++;
        break fieldLoop;
      } else if (c0 === CR && i + 1 < len && text.charCodeAt(i + 1) === LF) {
        if (touched) fields.push('');
        i += 2;
        line++;
        break fieldLoop;
      }

      // unquoted field (may begin with a lone CR)
      let k = i;
      while (k < len) {
        const cc = text.charCodeAt(k);
        if (cc === COMMA || cc === LF || cc === CR) break;
        k++;
      }
      let value = text.slice(i, k);
      i = k;
      let term = 0;
      while (i < len) {
        const cc = text.charCodeAt(i);
        if (cc === COMMA) {
          term = 1;
          break;
        }
        if (cc === LF) {
          term = 2;
          break;
        }
        if (cc === CR) {
          if (i + 1 < len && text.charCodeAt(i + 1) === LF) {
            term = 2;
            break;
          }
          errors.push({ code: 'stray_cr', line: recLine, row: recRow });
          const seg = i + 1;
          let m = seg;
          while (m < len) {
            const mc = text.charCodeAt(m);
            if (mc === COMMA || mc === LF || mc === CR) break;
            m++;
          }
          value += text.slice(seg, m);
          i = m;
          continue;
        }
      }
      if (value.length > 0) touched = true;
      fields.push(value);
      if (term === 1) {
        touched = true;
        i++;
        continue fieldLoop;
      }
      if (term === 2) {
        i += text.charCodeAt(i) === CR ? 2 : 1;
        line++;
      }
      break fieldLoop;
    }

    if (touched) {
      if (firstRecord) {
        width = fields.length;
        firstRecord = false;
        if (isHeader) {
          columns = fields;
        } else {
          rows.push(fields);
          rowIndex++;
        }
      } else {
        if (fields.length < width) {
          errors.push({ code: 'short_row', line: recLine, row: recRow, fields: fields.length });
          while (fields.length < width) fields.push('');
        } else if (fields.length > width) {
          errors.push({ code: 'long_row', line: recLine, row: recRow, extra: fields.slice(width) });
          fields.length = width;
        }
        rows.push(fields);
        rowIndex++;
      }
    }
  }

  if (header && firstRecord) columns = [];

  return { columns, rows, errors };
}
