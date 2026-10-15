export function Icon({
  name,
  size = 20,
}: {
  name:
    | 'arrow'
    | 'upload'
    | 'download'
    | 'plus'
    | 'check'
    | 'lock'
    | 'layers'
    | 'image'
    | 'close';
  size?: number;
}) {
  const paths = {
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    upload: 'M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5',
    download: 'M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4',
    plus: 'M12 5v14M5 12h14',
    check: 'm5 12 4 4L19 6',
    lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Z',
    layers: 'm12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5',
    image: 'M3 3h18v18H3Zm0 13 6-6 5 5 3-3 4 4M15 7h.01',
    close: 'm6 6 12 12M6 18 18 6',
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
