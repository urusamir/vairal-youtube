"use client";

import { useEffect, useState } from "react";
import { getCreatorProfileImage } from "@/lib/creator-profile-images";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();
}

export function CreatorAvatar({
  username,
  name,
  className,
  fallbackClassName,
}: {
  username: string;
  name: string;
  className: string;
  fallbackClassName?: string;
}) {
  const src = getCreatorProfileImage(username);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${name} profile image`}
        className={className}
        fetchPriority="high"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={
        fallbackClassName ||
        `${className} flex items-center justify-center bg-muted text-muted-foreground font-bold`
      }
    >
      {getInitials(name || username)}
    </div>
  );
}
