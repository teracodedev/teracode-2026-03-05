export interface DankaWithMembers {
  id: number;
  dankaCode: string;
  familyName: string;
  givenName: string;
  familyNameKana: string | null;
  givenNameKana: string | null;
  postalCode: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
  joinedAt: Date | null;
  leftAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  members: {
    id: number;
    dankaId: number;
    name: string;
    nameKana: string | null;
    relation: string | null;
    birthDate: Date | null;
    deathDate: Date | null;
    dharmaName: string | null;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export const CEREMONY_TYPE_LABELS: Record<string, string> = {
  MEMORIAL: "法要",
  REGULAR: "定例行事",
  FUNERAL: "葬儀・告別式",
  SPECIAL: "特別行事",
  OTHER: "その他",
};

export const CEREMONY_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "予定",
  COMPLETED: "完了",
  CANCELLED: "中止",
};
