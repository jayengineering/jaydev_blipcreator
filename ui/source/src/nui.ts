declare global {
  interface Window {
    GetParentResourceName?: () => string;
  }
}

const resourceName = window.GetParentResourceName?.() ?? 'jaydev_blipcreator';

export async function fetchNui<T = { success?: boolean }>(event: string, data: unknown = {}): Promise<T> {
  const response = await fetch(`https://${resourceName}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data),
  });

  return response.json();
}
