import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, kakaoprovider } from "@/firebase";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isLoading || email === "" || password === "") return;
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      const result = await signInWithPopup(auth, kakaoprovider);
      console.log("카카오 로그인 성공: ", result.user);
      navigate("/");
    } catch (error) {
      console.error("카카오 로그인 에러: ", error);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="mb-10">로그인</div>
      <form
        className="w-1/2 h-[300px] flex flex-col gap-3"
        onSubmit={handleSubmit}
      >
        <div>
          <Input
            name="email"
            type="email"
            placeholder="이메일"
            className="w-full"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <Input
            name="password"
            type="password"
            placeholder="비밀번호"
            className="w-full"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          type="submit"
          className="bg-third text-primary"
          value={isLoading ? "Loading..." : "Login"}
        >
          로그인
        </Button>
        <span className="text-center">or</span>
        <Button onClick={handleKakaoLogin} className="bg-kakao text-primary">
          카카오 로그인
        </Button>
        <Link to="/signup">
          <div className="w-full flex justify-center mt-5">
            <span className="border-b border-black text-sm">회원가입</span>
          </div>
        </Link>
      </form>
    </div>
  );
}
