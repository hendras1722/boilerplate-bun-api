export const parseLog = (line: string) => {
  const regex =
    /\[(.*?)\]\s(\w+)\s(.*?)\s-\sStatus:\s(\d+)\s-\sDuration:\s(.*?)\s-\sMsg:\s(.*)/;

  const match = line.match(regex);

  if (!match) return null;

  return {
    timestamp: match[1],
    method: match[2],
    url: match[3],
    status: Number(match[4]),
    duration: match[5],
    message: match[6],
  };
};