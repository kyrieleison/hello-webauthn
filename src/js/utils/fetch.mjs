export async function fetchJSON(url, opt) {
  const res = await fetch(url, opt)
  return res.json()
}
