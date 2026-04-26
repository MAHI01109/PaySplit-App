"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGroupStore, MOCK_CONTACTS } from "@/store/groupStore";
import { useAuthStore, User } from "@/store/authStore";
import { Button } from "@/app/components/ui/form/Button";
import styles from "./newGroup.module.css";

const GROUP_ICONS = ["🏠", "✈️", "🍔", "🎉", "💼", "🚗", "💡", "🎮"];

export default function NewGroupPage() {
  const router = useRouter();
  const { addGroup } = useGroupStore();
  const { user } = useAuthStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(GROUP_ICONS[0]);
  
  // By default, the current user is a member
  const [selectedMembers, setSelectedMembers] = useState<User[]>(user ? [user] : []);

  if (!user) return null;

  const toggleMember = (contact: User) => {
    // Current user cannot be removed
    if (contact.id === user.id) return;
    
    if (selectedMembers.find((m) => m.id === contact.id)) {
      setSelectedMembers(selectedMembers.filter((m) => m.id !== contact.id));
    } else {
      setSelectedMembers([...selectedMembers, contact]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGroup = {
      id: crypto.randomUUID(),
      name,
      icon,
      description,
      archived: false,
      members: selectedMembers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addGroup(newGroup);
    router.push(`/groups/${newGroup.id}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Group</h1>
      
      <form onSubmit={handleCreate} className={styles.form}>
        <div className={styles.section}>
          <label className={styles.label}>Group Icon</label>
          <div className={styles.iconSelector}>
            {GROUP_ICONS.map((i) => (
              <button
                type="button"
                key={i}
                className={`${styles.iconButton} ${icon === i ? styles.selectedIcon : ""}`}
                onClick={() => setIcon(i)}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label} htmlFor="name">Group Name</label>
          <input
            id="name"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Trip to Goa, Apartment Rent, etc."
            required
          />
        </div>

        <div className={styles.section}>
          <label className={styles.label} htmlFor="description">Description (Optional)</label>
          <input
            id="description"
            type="text"
            className={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this group for?"
          />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Add Members</label>
          <p className={styles.hint}>Select from your contacts to add them to the group.</p>
          <div className={styles.membersList}>
            {MOCK_CONTACTS.map((contact) => {
              const isSelected = selectedMembers.some((m) => m.id === contact.id);
              return (
                <div
                  key={contact.id}
                  className={`${styles.memberCard} ${isSelected ? styles.selectedMember : ""}`}
                  onClick={() => toggleMember(contact)}
                >
                  <div
                    className={styles.avatar}
                    style={{ backgroundColor: contact.avatarColor }}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <div className={styles.memberInfo}>
                    <p className={styles.memberName}>{contact.name}</p>
                    <p className={styles.memberEmail}>{contact.email}</p>
                  </div>
                  <div className={styles.checkbox}>
                    {isSelected && "✓"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="button" fullWidth  onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" fullWidth disabled={!name.trim() || selectedMembers.length < 2}>
            Create Group
          </Button>
        </div>
      </form>
    </div>
  );
}
