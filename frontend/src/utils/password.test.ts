import { describe, expect, it } from "vitest";

import {
  checkPassword,
  getPasswordStrength,
  hasLetterAndNumber,
  passwordScore,
} from "@/utils/password";

describe("checkPassword", () => {
  it("flags every satisfied rule", () => {
    expect(checkPassword("Siwar@123")).toEqual({
      length: true,
      letter: true,
      number: true,
      symbol: true,
    });
  });

  it("flags an empty string as failing every rule", () => {
    expect(checkPassword("")).toEqual({
      length: false,
      letter: false,
      number: false,
      symbol: false,
    });
  });
});

describe("hasLetterAndNumber", () => {
  it("requires both a letter and a digit", () => {
    expect(hasLetterAndNumber("abcdefgh")).toBe(false);
    expect(hasLetterAndNumber("12345678")).toBe(false);
    expect(hasLetterAndNumber("abcdefg1")).toBe(true);
  });
});

describe("passwordScore / getPasswordStrength", () => {
  it("scores by satisfied rule count", () => {
    expect(passwordScore("")).toBe(0);
    expect(passwordScore("abc")).toBe(1);
    expect(passwordScore("abcdefgh")).toBe(2);
    expect(passwordScore("abcd1234")).toBe(3);
    expect(passwordScore("abcd1234!")).toBe(4);
    expect(passwordScore("Abcd1234!")).toBe(4);
  });

  it("maps the score to weak / medium / strong", () => {
    expect(getPasswordStrength("")).toBe("weak");
    expect(getPasswordStrength("abc")).toBe("weak");
    expect(getPasswordStrength("abcdefgh")).toBe("medium");
    expect(getPasswordStrength("abcd1234")).toBe("medium");
    expect(getPasswordStrength("abcd1234!")).toBe("strong");
  });
});
