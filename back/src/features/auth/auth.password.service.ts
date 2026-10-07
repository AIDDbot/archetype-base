import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";

const COST = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
function derive(input: {
  password: string;
  salt: string;
  N: number;
  r: number;
  p: number;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      input.password,
      input.salt,
      32,
      { N: input.N, r: input.r, p: input.p, maxmem: COST.maxmem },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
  });
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await derive({ password, salt, ...COST });
  return `scrypt$${COST.N}$${COST.r}$${COST.p}$${salt}$${hash.toString("hex")}`;
}
export async function verifyPassword(input: { password: string; hash: string }) {
  const [, N, r, p, salt, stored] = input.hash.split("$");
  const hash = await derive({
    password: input.password,
    salt: salt!,
    N: Number(N),
    r: Number(r),
    p: Number(p),
  });
  return timingSafeEqual(hash, Buffer.from(stored!, "hex"));
}
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export function newToken() {
  return randomBytes(32).toString("base64url");
}
export const dummyPasswordHash = `scrypt$131072$8$1$00000000000000000000000000000000$${"00".repeat(32)}`;
