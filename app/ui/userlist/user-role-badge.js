import Image from 'next/image';
import api from "@/app/lib/twitch-api";

export const dynamic = "force-dynamic";

function getBadgeImage(props) {
	const fetchUrl = async () => {
		const result = await api.get('https://api.twitch.tv/helix/chat/badges/global');
		const roleData = result.data.data(function(role){
			  return role.set_id === props.role
			});
		if ( roleData.length === 1 ) {
			return roleData.versions[0].image_url_1x;
		} else if ( roleData.length === 0 ) {
			return;
		}
	}
}

export default function UserRoleBadge(props) {
	const imageUrl = getBadgeImage(props);
	return (
		<>
			<div className="user-role-badge">
				<Image
					src={imageUrl}
					alt={props.role}
					width={18}
					height={18}
				/>
			</div>
		</>
	);
}
