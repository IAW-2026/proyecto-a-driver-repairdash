type DecimalLike = {
  toNumber: () => number;
};

export function serializeMoney(
  value: DecimalLike,
) {
  return Number(
    value.toNumber().toFixed(2),
  );
}

export function serializeRate(
  value: number,
) {
  return Number(
    value.toFixed(4),
  );
}
