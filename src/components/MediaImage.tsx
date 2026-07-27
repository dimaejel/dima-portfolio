import { useQuery } from "@tanstack/react-query";
import { resolveMediaUrl } from "@/lib/cms";

/** Resolves a stored media value (bucket path or URL) to a usable URL. */
export function useMediaUrl(value?: string | null): string | null {
  const q = useQuery({
    queryKey: ["media-url", value],
    enabled: !!value,
    staleTime: 1000 * 60 * 60,
    queryFn: () => resolveMediaUrl(value),
  });
  return q.data ?? null;
}

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  path?: string | null;
  fallback?: string | null;
};

export function MediaImage({ path, fallback, alt = "", ...rest }: Props) {
  const url = useMediaUrl(path) ?? fallback ?? null;
  if (!url) return null;
  return <img src={url} alt={alt} {...rest} />;
}
