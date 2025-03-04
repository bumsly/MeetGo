import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { Invitee } from "@/types/meeting";

export const inviteUser = async (
  inviteEmail: string,
  hostEmail: string | null,
  currentInvitees: Invitee[],
  onInviteesUpdate: (invitees: Invitee[]) => void,
  setError: (error: string) => void
): Promise<void> => {
  // 이메일 입력 확인
  if (!inviteEmail) {
    setError("이메일을 입력해주세요");
    return;
  }

  // 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(inviteEmail)) {
    setError("이메일 형식이 올바르지 않습니다.");
    return;
  }

  // 본인 이메일인지 확인
  if (inviteEmail === hostEmail) {
    setError("본인 이메일은 초대할 수 없습니다.");
    return;
  }

  // 중복 초대 불가능
  if (currentInvitees.some((invitee) => invitee.email === inviteEmail)) {
    setError("이미 초대된 이메일입니다.");
    return;
  }

  try {
    // 사용자 조회 (Firestore)
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", inviteEmail));
    const querySnapshot = await getDocs(q);

    // 사용자가 존재하지 않는 경우
    if (querySnapshot.empty) {
      setError("해당 이메일로 등록된 사용자가 없습니다.");
      return;
    }

    // 사용자 데이터 추출
    const userDocSnapshot = querySnapshot.docs[0];
    const userDoc = userDocSnapshot.data();
    const newInvitee: Invitee = {
      uid: userDocSnapshot.id,
      email: userDoc.email,
      displayName: userDoc.name || inviteEmail.split("@")[0],
    };

    // 초대된 유저 목록 업데이트
    await onInviteesUpdate([...currentInvitees, newInvitee]);
    setError("");
  } catch (error) {
    console.error("초대 중 오류 발생:", error);
    setError("초대 과정에서 오류가 발생했습니다.");
  }
};
