import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다.")
  .refine(
    (value) => Buffer.byteLength(value, "utf8") <= 72,
    "비밀번호는 UTF-8 기준 72바이트 이하여야 합니다.",
  );

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email("올바른 이메일 형식이 아닙니다.")
    .max(255, "이메일은 255자 이하여야 합니다.")
    .transform((value) => value.toLowerCase()),

  password: passwordSchema,

  nickname: z
    .string()
    .trim()
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(50, "닉네임은 50자 이하여야 합니다.")
    .regex(
      /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9_-]+$/,
      "닉네임은 한글, 영문, 숫자, _, -만 사용할 수 있습니다.",
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("올바른 이메일 형식이 아닙니다.")
    .max(255, "이메일은 255자 이하여야 합니다.")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요.")
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "비밀번호가 올바르지 않습니다."),
});
