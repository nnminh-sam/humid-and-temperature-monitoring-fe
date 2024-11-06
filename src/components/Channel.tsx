import React, { useEffect, useState } from "react";
import {
  List,
  Typography,
  Spin,
  Button,
  Modal,
  Form,
  Input,
  message,
} from "antd";
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
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
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

        await fetchChannels();
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [apiHost, navigate]);

  const fetchChannels = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("User is not authenticated");
      }

      const channelResponse = await axios.get(`${apiHost}/api/v1/channels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChannels(channelResponse.data.data);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  };

  const addChannelHandler = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleFormSubmit = async (values: {
    name: string;
    description: string;
  }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("User is not authenticated");
      }

      await axios.post(
        `${apiHost}/api/v1/channels`,
        {
          name: values.name,
          description: values.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Channel created successfully!");
      setIsModalVisible(false);
      form.resetFields();
      await fetchChannels(); // Reload the channel list
    } catch (error) {
      console.error("Error creating channel:", error);
      message.error("Failed to create channel.");
    }
  };

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

          <Button
            type="primary"
            onClick={addChannelHandler}
            style={{ marginBottom: "20px" }}
          >
            Add Channel
          </Button>

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

          <Modal
            title="Create New Channel"
            visible={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            <Form form={form} onFinish={handleFormSubmit} layout="vertical">
              <Form.Item
                name="name"
                label="Channel Name"
                rules={[
                  { required: true, message: "Please enter a channel name" },
                ]}
              >
                <Input placeholder="Enter channel name" />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: "Please enter a description" },
                ]}
              >
                <Input placeholder="Enter description" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Create Channel
                </Button>
              </Form.Item>
            </Form>
          </Modal>
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
