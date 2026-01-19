export function optimizeImage(
  url: string,
  width = 200,
  quality = 70
) {
  return `${url}?width=${width}&quality=${quality}`;
}
