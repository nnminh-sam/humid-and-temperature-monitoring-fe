// App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Channel from "./components/Channel";
import Feed from "./components/Feed"; // Import the Feed component

const App: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Channel />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/channel/:channelId" element={<Feed />} />{" "}
        {/* Updated route for Feed */}
      </Routes>
    </div>
  );
};

export default App;
