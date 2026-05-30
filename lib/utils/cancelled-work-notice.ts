export function getCancelledWorkNoticeKey(
  trabajoId: string,
  actualizadoEn: Date | string,
) {
  return `repairdash:cancelled-work:${trabajoId}:${new Date(
    actualizadoEn,
  ).getTime()}`;
}
