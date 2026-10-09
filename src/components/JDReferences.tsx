import { safeExternalUrl } from "../lib";
import type { JD } from "../types";

export function JDReferences({ jd }: { jd?: JD }) {
  return <>{jd?.references?.map(reference => {
    const url = safeExternalUrl(reference.url);
    return url ? <small className="cell-note" key={reference.url}>
      <a href={url} target="_blank" rel="noreferrer">{reference.label}</a>
      {" · 核验于 "}<time dateTime={reference.checkedAt}>{reference.checkedAt}</time>
    </small> : null;
  })}</>;
}
