"use client";
import Image from "next/image";
import type { SystemUser } from "@/lib/types";

type AvatarUser = Pick<SystemUser, "name" | "initials" | "photo">;

/**
 * Zdjęcie pracownika. Konta bez wgranego zdjęcia dostają granatowe koło
 * z inicjałami, dzięki czemu układ nie rozjeżdża się do czasu uzupełnienia pliku.
 */
export function UserAvatar({ user, size, className = "" }: { user: AvatarUser; size: number; className?: string }) {
  if (!user.photo)
    return (
      <span
        style={{ height: size, width: size, fontSize: Math.round(size * 0.34) }}
        className={`flex shrink-0 items-center justify-center rounded-full bg-(--color-navy) font-bold text-white ${className}`}
        title={`${user.name} · brak zdjęcia profilowego`}
      >
        {user.initials}
      </span>
    );
  return (
    <Image
      src={user.photo}
      alt={user.name}
      width={size * 2}
      height={size * 2}
      style={{ height: size, width: size }}
      className={`shrink-0 rounded-full object-cover object-top ring-1 ring-(--color-border) ${className}`}
    />
  );
}
