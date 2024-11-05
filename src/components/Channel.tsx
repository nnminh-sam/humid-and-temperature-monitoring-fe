// Channel.tsx
import React, { useEffect, useState } from "react";
import { List, Typography, Spin } from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Channel.css"; // Optional for additional custom styling

interface Channel {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  email: string;
  fullName: string;
}

const Channel: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("User is not authenticated");
        }

        const userResponse = await axios.get(`${apiHost}/api/v1/users/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data.data);

        const channelResponse = await axios.get(`${apiHost}/api/v1/channels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChannels(channelResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [apiHost, navigate]);

  if (loading) {
    return <Spin tip="Loading user and channel data..." />;
  }

  return (
    <div className="channel-container">
      {user ? (
        <div>
          <Typography.Title level={3}>User Information</Typography.Title>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Full Name:</strong> {user.fullName}
          </p>

          <Typography.Title level={4} style={{ marginTop: "20px" }}>
            Channels
          </Typography.Title>

          <div className="channel-header">
            <div className="channel-cell">Name</div>
            <div className="channel-cell">Description</div>
            <div className="channel-cell">Created At</div>
            <div className="channel-cell">Updated At</div>
          </div>

          <List
            itemLayout="horizontal"
            dataSource={channels}
            renderItem={(channel) => (
              <List.Item className="channel-row">
                <div className="channel-cell">
                  <Link
                    to={`/channel/${channel.id}`}
                    style={{ color: "blue", textDecoration: "underline" }}
                  >
                    {channel.name}
                  </Link>
                </div>
                <div className="channel-cell">{channel.description}</div>
                <div className="channel-cell">
                  {new Date(channel.createdAt).toLocaleString()}
                </div>
                <div className="channel-cell">
                  {new Date(channel.updatedAt).toLocaleString()}
                </div>
              </List.Item>
            )}
          />
        </div>
      ) : (
        <Typography.Text type="danger">
          Failed to load user data.
        </Typography.Text>
      )}
    </div>
  );
};

export default Channel;
