import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    imageFile: null as File | null,
    imagePreview: "",
    email: "",
    password: "",
    passwordCheck: "",
    phoneNumber: "",
    birthday: "",
    checkbox: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isFormValid = useMemo(() => {
    const {
      name,
      gender,
      imageFile,
      email,
      password,
      passwordCheck,
      phoneNumber,
      birthday,
      checkbox,
    } = formData;

    return (
      name.trim().length >= 2 &&
      (gender === "man" || gender === "woman") &&
      imageFile !== null &&
      email.includes("@") &&
      email.includes(".") &&
      password.length >= 6 &&
      password === passwordCheck &&
      phoneNumber.trim().length >= 10 &&
      birthday.trim().length === 8 &&
      checkbox === true
    );
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file" && name === "imageFile") {
      const file = files?.[0];

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            imageFile: file,
            imagePreview: reader.result as string,
          }));
        };

        reader.readAsDataURL(file);
      }
      return;
    }

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      let photoURL = "";
      if (formData.imageFile) {
        const imageRef = ref(
          storage,
          `profiles/${user.uid}/${formData.imageFile.name}`
        );
        await uploadBytes(imageRef, formData.imageFile);
        photoURL = await getDownloadURL(imageRef);
      }

      await updateProfile(user, {
        displayName: formData.name,
        photoURL: photoURL,
      });

      navigate("/");
    } catch (err) {
      setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <form
        className="w-full px-[48px] h-[90%] flex flex-col gap-1 text-sm"
        onSubmit={handleSubmit}
      >
        <div className="my-10 font-bold text-xl text-center">회원가입</div>
        <div className="flex justify-between mb-6">
          <div className="w-1/2 flex flex-col">
            <label htmlFor="name">
              이름<span className="text-rose-500 ml-1">*</span>
            </label>
            <Input
              type="name"
              name="name"
              id="name"
              placeholder="실명을 입력하세요"
              className="mb-7 text-sm"
              value={formData.name}
              onChange={handleChange}
            />
            <label htmlFor="gender">
              성별<span className="text-rose-500 ml-1">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex justify-between items-center" id="gender">
                <div className="w-15 flex items-center space-x-2 mr-2">
                  <Input
                    type="radio"
                    name="gender"
                    value="man"
                    id="man"
                    checked={formData.gender === "man"}
                    onChange={handleChange}
                    className="w-5"
                  />
                  <Label htmlFor="man">남자</Label>
                </div>
                <div className="w-15 flex items-center space-x-2">
                  <Input
                    type="radio"
                    name="gender"
                    value="woman"
                    id="woman"
                    checked={formData.gender === "woman"}
                    onChange={handleChange}
                    className="w-5"
                  />
                  <Label htmlFor="woman">여자</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mb-4">
              {formData.imagePreview ? (
                <img
                  src={formData.imagePreview}
                  alt="프로필 미리보기"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  미리보기
                </div>
              )}
            </div>
            <Input
              type="file"
              name="imageFile"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              id="profile-image"
            />
            <label
              htmlFor="profile-image"
              className="cursor-pointer bg-white py-1.5 px-3 border rounded-md hover:bg-gray-50 text-xs"
            >
              프로필 사진 선택
            </label>
          </div>
        </div>
        <label htmlFor="email">
          이메일<span className="text-rose-500 ml-1">*</span>
        </label>
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="이메일 주소"
          className="mb-5 text-sm"
          value={formData.email}
          onChange={handleChange}
        />
        <label htmlFor="password">
          비밀번호<span className="text-rose-500 ml-1">*</span>
        </label>
        <Input
          type="password"
          name="password"
          id="password"
          placeholder="비밀번호"
          className="mb-5 text-sm"
          value={formData.password}
          onChange={handleChange}
        />
        <label htmlFor="passwordCheck">
          비밀번호 확인<span className="text-rose-500 ml-1">*</span>
        </label>
        <Input
          type="password"
          name="passwordCheck"
          id="passwordCheck"
          placeholder="비밀번호 확인"
          className="mb-5 text-sm"
          value={formData.passwordCheck}
          onChange={handleChange}
        />
        <label htmlFor="phoneNumber">
          휴대폰 번호<span className="text-rose-500 ml-1">*</span>
        </label>
        <Input
          type="number"
          name="phoneNumber"
          id="phoneNumber"
          placeholder="'-' 구분없이 입력"
          className="text-sm mb-5"
          value={formData.phoneNumber}
          onChange={handleChange}
        />
        <label htmlFor="birthday">
          생년월일<span className="text-rose-500 ml-1">*</span>
        </label>
        <Input
          type="number"
          name="birthday"
          id="birthday"
          placeholder="8자리 입력"
          className="text-sm"
          value={formData.birthday}
          onChange={handleChange}
        />
        <div className="flex justify-center items-center my-8">
          <Input
            type="checkbox"
            name="checkbox"
            id="checkbox"
            className="w-4 h-4 mr-2"
            checked={formData.checkbox}
            onChange={handleChange}
          />
          <label
            htmlFor="checkbox"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            개인정보 수집 및 이용에 동의합니다.
          </label>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          type="submit"
          disabled={!isFormValid || loading}
          className={`bg-third text-primary ${
            isFormValid && !loading
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "처리중..." : "가입하기"}
        </Button>
        <span className="text-center my-3 text-lg">or</span>
        <Link to="/login">
          <Button className="w-full mb-10 bg-secondary text-primary">
            로그인하기
          </Button>
        </Link>
      </form>
    </div>
  );
}
