import React, { useEffect, useRef, useState } from 'react';
import { Box, Stack, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ScrollableFeed from 'react-scrollable-feed';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

interface MemberData {
	_id: string;
	name: string;
	memberImage?: string;
}

interface MessagePayload {
	event: string;
	text: string;
	memberData: MemberData;
}

interface Props {
	user: MemberData;
	socket: any; // WebSocket instance
	openButton?: boolean;
	onlineUsers?: number;
}

const ChatComponent: React.FC<Props> = ({ user, socket, openButton = true, onlineUsers = 0 }) => {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const textInput = useRef<HTMLInputElement>(null);
	const chatContentRef = useRef<HTMLDivElement>(null);

	// ✅ Handle incoming WebSocket messages
	useEffect(() => {
		if (!socket) return;

		const handleMessage = (data: MessagePayload) => {
			if (data.event === 'message') {
				setMessagesList((prev) => [...prev, data]);
			}
		};

		socket.on('message', handleMessage);

		return () => {
			socket.off('message', handleMessage);
		};
	}, [socket]);

	const handleOpenChat = () => setOpen(!open);

	const getInputMessageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessage(e.target.value);
	};

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') onClickHandler();
	};

	const onClickHandler = () => {
		if (message.trim() === '') return;

		const payload = {
			event: 'message',
			text: message,
			memberData: user,
		};

		socket.emit('message', payload);
		setMessage('');
	};

	return (
		<Stack className="chatting">
			{openButton && (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <CloseFullscreenIcon /> : <MarkChatUnreadIcon />}
				</button>
			)}
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className="chat-top">
					<div style={{ fontFamily: 'Nunito' }}>Online Chat</div>
					<span style={{ marginLeft: 12 }}>{onlineUsers} users</span>
				</Box>
				<Box className="chat-content" id="chat-content" ref={chatContentRef}>
					<ScrollableFeed>
						<Stack className="chat-main">
							<div className="welcome">Welcome to Live chat!</div>
							{messagesList.map((ele, index) => {
								const { memberData, text } = ele;
								const memberImage = memberData?.memberImage || '/img/profile/defaultUser.svg';

								return memberData?._id === user?._id ? (
									<Box key={index} style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0' }}>
										<div className="msg-right">{text}</div>
									</Box>
								) : (
									<Box key={index} style={{ display: 'flex', alignItems: 'flex-start', margin: '10px 0' }}>
										<Avatar alt={memberData.name} src={memberImage} />
										<div className="msg-left">{text}</div>
									</Box>
								);
							})}
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box className="chat-bott">
					<input
						ref={textInput}
						type="text"
						name="message"
						value={message}
						className="msg-input"
						placeholder="Type message"
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button className="send-msg-btn" onClick={onClickHandler}>
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default ChatComponent;
