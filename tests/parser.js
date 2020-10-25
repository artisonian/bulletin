import { suite } from "uvu";
import * as assert from "uvu/assert";
import * as parser from "../src/parser";

const lex = suite("lex");

lex('emits "bullet" token', () => {
  const tt = [
    ["- hello there", "-"],
    ["@ hello there", "@"],
    ["! hello there", "!"],
    ["+ hello there", "+"],
    ["^ hello there", "^"],
  ];

  for (const [input, expected] of tt) {
    const { value } = parser.lex(input).next();
    assert.equal(value, {
      token: "bullet",
      text: expected,
    });
  }
});

lex("fails if first character is not a valid symbol", () => {
  const tt = [
    ["1 hello there", /Expected symbol, got "1"/],
    ["hello there", /Expected symbol, got "h"/],
    ["(hello there)", /Expected symbol, got "\("/],
    ["] hello there", /Expected symbol, got "]"/],
    ['" hello there', /Expected symbol, got "\""/],
  ];

  for (const [input, expected] of tt) {
    assert.throws(() => parser.lex(input).next(), expected);
  }
});

lex('emits "text" token', () => {
  const tt = [
    ["- hello there", "hello there"],
    ["@ goodbye", "goodbye"],
    ["! !hello", "!hello"],
    ["+hiya", "hiya"],
  ];

  for (const [input, expected] of tt) {
    const lexer = parser.lex(input);
    lexer.next(); // ignore first token

    const { value } = lexer.next();
    assert.equal(value, {
      token: "text",
      text: expected,
    });
  }
});

lex('emits "annotation" token if present', () => {
  const tt = [
    ["- [greeting] hello there", { token: "annotation", text: "greeting" }],
    ["@[nighttime] goodbye", { token: "annotation", text: "nighttime" }],
    ["! !hello", { token: "text", text: "!hello" }],
  ];

  for (const [input, expected] of tt) {
    const lexer = parser.lex(input);
    lexer.next(); // ignore first token

    const { value } = lexer.next();
    assert.equal(value, expected);
  }
});

/* skip
lex('emits "tag" token if present', () => {
  const tt = [
    [
      "- [greeting] hello there #today",
      [
        { token: "bullet", text: "-" },
        { token: "annotation", text: "greeting" },
        { token: "text", text: "hello there" },
        { token: "tag", text: "today" },
      ],
    ],
    [
      "@ goodbye #next-day #9:00am",
      [
        { token: "bullet", text: "@" },
        { token: "text", text: "goodbye" },
        { token: "tag", text: "next-day" },
        { token: "tag", text: "9:00am" },
      ],
    ],
    [
      "! !hello",
      [
        { token: "bullet", text: "!" },
        { token: "text", text: "!hello" },
      ],
    ],
  ];

  for (const [input, expected] of tt) {
    const tokens = Array.from(parser.lex(input));
    assert.equal(tokens, expected);
  }
});
*/

lex.run();
