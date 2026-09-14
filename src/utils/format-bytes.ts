// Abaixo de 1 MB, "0.0 MB" não diz nada — a fixture de teste (33 KB) e
// qualquer PNG pequeno cairiam nisso. KB abaixo do corte, MB acima.
export const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
