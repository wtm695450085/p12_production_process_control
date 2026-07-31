import type { AccessLevel, DocumentSymbol, ModuleId, SystemUser } from "./types";

const noAccess = (): Record<ModuleId, AccessLevel> => ({
  1: "none", 2: "none", 3: "none", 4: "none", 5: "none", 6: "none", 7: "none", 8: "none", 9: "none",
});

function permissions(overrides: Partial<Record<ModuleId, AccessLevel>>): Record<ModuleId, AccessLevel> {
  return { ...noAccess(), ...overrides };
}

export const systemUsers: SystemUser[] = [
  {
    id: "admin", name: "Jakub Majchrzak", initials: "JM", photo: "/team/jakub.png", jobTitle: "CEO", roleName: "Administrator systemu", active: true,
    permissions: permissions({ 1:"admin",2:"admin",3:"admin",4:"admin",5:"admin",6:"admin",7:"admin",8:"admin",9:"admin" }),
    editableDocuments: ["KK","KP","AK","ZK","ZP","PZL","RZ","RN","PK","RKR","WP","TPP","KF","ZAF","PSF","KT","KL","SP","ZM","PZ","WZ","FZ","ALR"],
  },
  {
    id: "zofia", name: "Zofia Kowalska", initials: "ZK", photo: "/team/zofia.png", jobTitle: "Operatorka wtryskarki", roleName: "Operator produkcji", active: true,
    permissions: permissions({ 1:"view",2:"view",3:"edit",4:"view",5:"view",6:"view",7:"view",8:"none",9:"none" }),
    editableDocuments: ["RZ","ZAF"],
  },
  {
    id: "ania", name: "Anna Nowak", initials: "AN", photo: "/team/anna.png", jobTitle: "Operatorka wtryskarki", roleName: "Operator produkcji", active: true,
    permissions: permissions({ 1:"view",2:"view",3:"edit",4:"view",5:"view",6:"view",7:"view",8:"none",9:"none" }),
    editableDocuments: ["RZ","ZAF"],
  },
  {
    id: "bartek", name: "Bartosz Wiśniewski", initials: "BW", photo: "/team/bartosz.png", jobTitle: "Nastawiacz", roleName: "Nastawiacz maszyn", active: true,
    permissions: permissions({ 1:"view",2:"view",3:"edit",4:"view",5:"view",6:"view",7:"none",8:"none",9:"none" }),
    editableDocuments: ["RN","ZAF"],
  },
  {
    id: "kierownik", name: "Piotr Wójcik", initials: "PW", photo: "/team/piotr.png", jobTitle: "Kierownik produkcji", roleName: "Kierownik produkcji", active: true,
    permissions: permissions({ 1:"view",2:"edit",3:"edit",4:"edit",5:"view",6:"view",7:"view",8:"view",9:"view" }),
    editableDocuments: ["ZP","PZL","PK","RKR","WP","TPP"],
  },
  {
    id: "narzedziownia", name: "Stanisław Kaczmarek", initials: "SK", photo: "/team/stanislaw.png", jobTitle: "Narzędziowiec", roleName: "Narzędziownia", active: true,
    permissions: permissions({ 1:"view",2:"view",3:"view",4:"view",5:"edit",6:"view",7:"none",8:"none",9:"none" }),
    editableDocuments: ["KF","ZAF","PSF"],
  },
  {
    id: "handlowiec", name: "Karolina Majewska", initials: "KM", photo: "/team/karolina.png", jobTitle: "Handlowiec", roleName: "Sprzedaż", active: true,
    permissions: permissions({ 1:"edit",2:"edit",3:"none",4:"view",5:"none",6:"none",7:"view",8:"none",9:"view" }),
    editableDocuments: ["KK","KP","AK","ZK"],
  },
  {
    id: "michal", name: "Michał Zieliński", initials: "MZ", photo: "/team/michal.png", jobTitle: "Operator wtryskarki", roleName: "Operator produkcji", active: true,
    permissions: permissions({ 1:"view",2:"view",3:"edit",4:"view",5:"view",6:"view",7:"view",8:"none",9:"none" }),
    editableDocuments: ["RZ","ZAF"],
  },
  {
    id: "technolog", name: "Marek Lewandowski", initials: "ML", photo: "/team/marek.png", jobTitle: "Technolog", roleName: "Technologia", active: true,
    permissions: permissions({ 1:"edit",2:"view",3:"view",4:"view",5:"view",6:"edit",7:"view",8:"none",9:"view" }),
    editableDocuments: ["KP","KT"],
  },
  {
    id: "kontrola", name: "Ewa Kamińska", initials: "EK", photo: "/team/ewa.png", jobTitle: "Kontrola jakości", roleName: "Kontrola jakości", active: true,
    permissions: permissions({ 1:"view",2:"edit",3:"edit",4:"view",5:"view",6:"view",7:"view",8:"none",9:"view" }),
    editableDocuments: ["PZL","PK"],
  },
  {
    id: "logistyka", name: "Iwona Król", initials: "IK", photo: "/team/iwona.png", jobTitle: "Specjalista ds. logistyki", roleName: "Logistyka", active: true,
    permissions: permissions({ 1:"view",2:"view",3:"none",4:"view",5:"none",6:"view",7:"edit",8:"view",9:"none" }),
    editableDocuments: ["KL","SP"],
  },
  {
    id: "magazyn", name: "Robert Dąbrowski", initials: "RD", photo: "/team/robert.png", jobTitle: "Magazynier", roleName: "Magazyn", active: true,
    permissions: permissions({ 1:"view",2:"view",3:"none",4:"view",5:"none",6:"none",7:"edit",8:"edit",9:"none" }),
    editableDocuments: ["SP","PZ","WZ"],
  },
  {
    id: "ksiegowosc", name: "Beata Pawlak", initials: "BP", photo: "/team/beata.png", jobTitle: "Księgowa", roleName: "Księgowość", active: true,
    permissions: permissions({ 1:"view",2:"view",3:"view",4:"none",5:"none",6:"none",7:"none",8:"edit",9:"view" }),
    editableDocuments: ["FZ"],
  },
];

export function getSystemUser(id: string): SystemUser {
  return systemUsers.find((user) => user.id === id) ?? systemUsers[0]!;
}

export function canView(user: SystemUser, moduleId: ModuleId): boolean {
  return user.permissions[moduleId] !== "none";
}

export function canEditModule(user: SystemUser, moduleId: ModuleId): boolean {
  return user.permissions[moduleId] === "edit" || user.permissions[moduleId] === "admin";
}

export function canEditDocument(user: SystemUser, symbol: DocumentSymbol): boolean {
  return user.permissions[1] === "admin" || user.editableDocuments.includes(symbol);
}

/**
 * Właściciel / zarząd — pełne prawo do analityki zarządczej. Tylko ta rola widzi
 * raport właścicielski, bo pokazuje on stawki i marże na poziomie szarży.
 */
export function isOwner(user: SystemUser): boolean {
  return user.permissions[9] === "admin";
}
