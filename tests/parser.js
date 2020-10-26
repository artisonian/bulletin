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

lex.run();

const parse = suite("parse");

parse("recognizes all-day events", () => {
  assert.equal(parser.parse("@ Conference"), {
    type: "event",
    text: "Conference",
  });
  assert.equal(parser.parse("@ Conference #online"), {
    type: "event",
    text: "Conference",
    tags: ["online"],
  });
});

parse("recognizes scheduled events", () => {
  assert.equal(parser.parse("@ [9:30a] Morning Meeting"), {
    type: "event",
    text: "Morning Meeting",
    time: [9, 30],
  });
  assert.equal(parser.parse("@ [9:30 am] Morning Meeting"), {
    type: "event",
    text: "Morning Meeting",
    time: [9, 30],
  });
  assert.equal(parser.parse("@ [12:00 am] Midnight #edge-case"), {
    type: "event",
    text: "Midnight",
    time: [0, 0],
    tags: ["edge-case"],
  });
  assert.equal(parser.parse("@ [12:00 pm] Noon #edge #case"), {
    type: "event",
    text: "Noon",
    time: [12, 0],
    tags: ["edge", "case"],
  });
});

parse("recognizes tasks", () => {
  assert.equal(parser.parse("! Take out the papers #andthetrash"), {
    type: "task",
    text: "Take out the papers",
    state: "ready",
    tags: ["andthetrash"],
  });
  assert.equal(parser.parse("! [doing] Scrub the kitchen floor"), {
    type: "task",
    text: "Scrub the kitchen floor",
    state: "doing",
  });
});

parse.run();
