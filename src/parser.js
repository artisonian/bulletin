const VALID_SYMBOLS = "!#$%&*+,./:;<=>?@^_`|~-";

export function* lex(input) {
  const scanner = scan(input);

  if (!scanner.accept(VALID_SYMBOLS)) {
    throw new Error(`Expected symbol, got "${scanner.peek()}"`);
  } else {
    yield scanner.emit("bullet");
  }
  scanner.skipAny(" ");

  let chr = scanner.peek();
  if (chr === "[") {
    scanner.skipAny("[");
    while (scanner.next() !== "]") {}
    scanner.backup();
    yield scanner.emit("annotation");
    scanner.skipAny("]");
  }
  scanner.skipAny(" ");

  while (scanner.next()) {}
  yield scanner.emit("text");
}

function scan(input) {
  return {
    input,
    start: 0,
    pos: 0,

    next() {
      if (this.pos === this.input.length) {
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
      const c1 = this.next();
      if (c1 == null) {
        return null;
      }

      const c2 = this.next();
      if (c2 == null) {
        this.pos -= 1;
        return c2;
      }

      this.pos -= 2;
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

    skipAny(str) {
      this.acceptRun(str);
      this.ignore();
    },

    emit(type) {
      const text = this.input.substring(this.start, this.pos);
      this.start = this.pos;
      return { token: type, text };
    },
  };
}
