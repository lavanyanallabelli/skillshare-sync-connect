import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Main } from "@/components/ui/main";
import { SettingsProfile } from "@/components/settings/SettingsProfile";
import { SettingsAccount } from "@/components/settings/SettingsAccount";

const Settings: React.FC = () => {
  const { userId } = useAuth();

  return (
    <Main>
      <div className="container relative pb-10">
        <div className="flex flex-col gap-6">
          <SettingsProfile userId={userId} />
          <SettingsAccount userId={userId} />
        </div>
      </div>
    </Main>
  );
};

export default Settings;
