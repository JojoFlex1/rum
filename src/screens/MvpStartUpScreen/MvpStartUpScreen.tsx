import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";

export const MvpStartUpScreen = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center w-full bg-transparent">
      <div className="relative w-[393px] h-[853px] overflow-hidden">
        <div className="w-full h-full">
          <div className="relative w-full h-full">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full [background:url(..//background.png)_50%_50%_/_cover]">
              {/* Status Bar */}
              <header className="relative h-[42px] bg-white backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] shadow-frosted-glass">
                <div className="absolute w-14 h-[17px] top-[13px] left-[21px]">
                  <div className="absolute w-[54px] -top-px left-0 [font-family:'SF_Pro_Text-Semibold',Helvetica] font-normal text-neutraldarkdarkest text-[15px] text-center tracking-[-0.17px] leading-[normal]">
                    3:33
                  </div>
                </div>

                <div className="absolute w-[68px] h-3.5 top-[15px] left-[311px] overflow-hidden">
                  <div className="absolute -top-1 left-[41px] [font-family:'SF_Pro_Text-Regular',Helvetica] font-normal text-neutraldarkdarkest text-[17px] tracking-[0] leading-[normal] whitespace-nowrap">
                    􀛨
                  </div>

                  <img
                    className="absolute w-[17px] h-[11px] top-0.5 left-0"
                    alt="Signal"
                    src="/signal.svg"
                  />

                  <div className="absolute -top-0.5 left-[21px] [font-family:'SF_Pro_Text-Regular',Helvetica] font-normal text-neutraldarkdarkest text-sm tracking-[0] leading-[normal]">
                    􀙇
                  </div>
                </div>
              </header>
            </div>

            {/* Logo */}
            <div className="absolute w-[257px] h-[260px] top-[91px] left-[68px] bg-[url(/screenshot-2025-02-02-at-10-49-52-am-3.png)] bg-[100%_100%]" />

            {/* Tagline */}
            <Card className="absolute w-[345px] top-[439px] left-6 border-none bg-transparent shadow-none">
              <CardContent className="p-0">
                <h1 className="[font-family:'Barlow',Helvetica] font-extrabold text-[#cbab58] text-2xl text-center tracking-[0.24px] leading-normal">
                  Connecting Worlds
                  <br />
                  with Travelers
                </h1>
              </CardContent>
            </Card>

            {/* Get Started Button */}
            <button
              onClick={() => navigate("/login")}
              className="absolute bottom-32 left-1/2 transform -translate-x-1/2 px-8 py-3 bg-[#cbab58] text-white font-semibold rounded-lg hover:bg-[#b69843]"
            >
              Get Started
            </button>

            {/* Powered By Logo */}
        </div>
      </div>
    </div>
  );
};
  )
}