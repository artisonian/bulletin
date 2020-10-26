export function parse(input) {
  const lexer = lex(input);
  const {
    value: { token, text },
    done,
  } = lexer.next();
  if (done) {
    throw new Error(`Unexpected EOF`);
  } else if (token !== "bullet") {
    throw new Error(`Expected bullet, got "${token}"`);
  }
  switch (text) {
    case "@":
      return parseEvent(lexer);
    case "!":
      return parseTask(lexer);
    default:
      throw new Error("Invalid entry type");
  }
}

function parseEvent(lexer) {
  const result = { type: "event" };
  for (const { token, text } of lexer) {
    if (token === "tag") {
      if (!result.tags) {
        result.tags = [];
      }
      result.tags.push(text);
    } else if (token === "annotation") {
      result.time = [];
      const scanner = scan(text);
      scanner.acceptRun("0123456789");
      scanner.push("hours");
      result.time.push(parseInt(scanner.pop().text, 10));
      scanner.ignoreRun(":");
      scanner.acceptRun("0123456789");
      scanner.push("minutes");
      result.time.push(parseInt(scanner.pop().text, 10));
      scanner.ignoreRun(" ");
      const chr = scanner.next();
      if (chr === "a" && result.time[0] === 12) {
        result.time[0] = 0;
      } else if (chr === "p" && result.time[0] !== 12) {
        result.time[0] += 12;
      }
    } else {
      result[token] = text;
    }
  }
  return result;
}

function parseTask(lexer) {
  const result = { type: "task", state: "ready" };
  for (const { token, text } of lexer) {
    if (token === "tag") {
      if (!result.tags) {
        result.tags = [];
      }
      result.tags.push(text);
    } else if (token === "annotation") {
      result.state = text;
    } else {
      result[token] = text;
    }
  }
  return result;
}

export function* lex(input) {
  const scanner = scan(input);
  let lexer = lexSymbol;
  while ((lexer = lexer(scanner))) {
    const token = scanner.pop();
    if (token) yield token;
  }
}

function lexSymbol(scanner) {
  const valid = "!#$%&*+,./:;<=>?@^_`|~-";
  if (!scanner.accept(valid)) {
    throw new Error(`Expected symbol, got "${scanner.peek()}"`);
  } else {
    scanner.push("bullet");
  }
  return lexAnnotation;
}

function lexAnnotation(scanner) {
  scanner.ignoreRun(" ");
  let chr = scanner.peek();
  if (chr === "[") {
    scanner.ignoreRun("[");
    while (scanner.next() !== "]") {}
    scanner.backup();
    scanner.push("annotation");
    scanner.ignoreRun("]");
  }
  return lexText;
}

function lexText(scanner) {
  scanner.ignoreRun(" ");
  let chr;
  while ((chr = scanner.peek2()) && chr !== " #") {
    scanner.next();
  }
  scanner.push("text");
  return lexTag;
}

function lexTag(scanner) {
  scanner.ignoreRun(" ");
  let chr = scanner.peek();
  if (chr !== "#") {
    return null;
  }
  scanner.ignoreRun("#");
  while ((chr = scanner.peek2()) && chr !== " #") {
    scanner.next();
  }
  scanner.push("tag");
  return lexTag;
}

function scan(input) {
  return {
    input,
    start: 0,
    pos: 0,
    tokens: [],

    get done() {
      return this.pos >= this.input.length;
    },

    next() {
      if (this.done) {
        return null;
      }
      const chr = this.input[this.pos];
      this.pos += 1;
      return chr;
    },

    backup() {
      this.pos -= 1;
    },

    peek() {
      const chr = this.next();
      this.backup();
      return chr;
    },

    peek2() {
      const pos = this.pos;
      const c1 = this.next() || "";
      const c2 = this.next() || "";
      this.pos = pos;
      return c1 + c2;
    },

    accept(str) {
      if (str.includes(this.next())) {
        return true;
      }
      this.backup();
      return false;
    },

    acceptRun(str) {
      while (this.accept(str)) {}
    },

    ignore() {
      this.start = this.pos;
    },

    ignoreRun(str) {
      this.acceptRun(str);
      this.ignore();
    },

    push(type) {
      const text = this.input.substring(this.start, this.pos);
      this.start = this.pos;
      this.tokens.push({ token: type, text });
    },

    pop() {
      return this.tokens.pop();
    },
  };
}
