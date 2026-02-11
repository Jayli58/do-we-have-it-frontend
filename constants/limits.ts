const parseLimit = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

export const FIELD_MAX = parseLimit(process.env.NEXT_PUBLIC_FIELD_MAX, 50);
export const COMMENT_MAX = parseLimit(process.env.NEXT_PUBLIC_COMMENT_MAX, 100);
