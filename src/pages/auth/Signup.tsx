import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().min(2).max(50),
});

export default function Signup() {
  const [filled, setFilled] = useState(false);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <form className="w-1/2 h-[90%] flex flex-col gap-1 text-sm">
        <div className="my-10 font-bold text-xl text-center">회원가입</div>
        <label htmlFor="email">
          이메일<span className="text-rose-500 ml-1">*</span>
        </label>
        <Input type="email" id="email" className="mb-5 text-sm" />
        <label htmlFor="password">
          비밀번호<span className="text-rose-500 ml-1">*</span>
        </label>
        <Input type="password" id="password" className="mb-5 text-sm" />
        <label htmlFor="password-check">
          비밀번호 확인<span className="text-rose-500 ml-1">*</span>
        </label>
        <Input type="password" id="password-check" className="mb-5 text-sm" />
        <label htmlFor="name">
          이름<span className="text-rose-500 ml-1">*</span>
        </label>
        <Input type="name" id="name" className="mb-5 text-sm" />
        <label htmlFor="gender" className="mb-1">
          성별<span className="text-rose-500 ml-1">*</span>
        </label>
        <div className="flex items-center space-x-2 mb-6">
          <RadioGroup defaultValue="man" className="flex">
            <div className="flex items-center space-x-2 mr-2">
              <RadioGroupItem value="남자" id="man" />
              <Label htmlFor="man">남자</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="woman" id="woman" />
              <Label htmlFor="woman">여자</Label>
            </div>
          </RadioGroup>
        </div>
        <label htmlFor="phone-number">
          전화번호<span className="text-rose-500 ml-1">*</span>
        </label>
        <Input
          type="number"
          id="phone-number"
          placeholder="'-' 는 제외"
          className="text-sm"
        />
        <div className="flex justify-center items-center my-8">
          <Checkbox id="terms" className="mr-2" />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            개인정보 수집 및 이용에 동의합니다.
          </label>
        </div>
        <Button type="submit" className="bg-third text-primary">
          회원가입
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
