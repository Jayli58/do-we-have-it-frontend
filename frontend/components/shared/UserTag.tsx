import AccountBoxIcon from "@mui/icons-material/AccountBox";

interface UserTagProps {
  name: string;
}

export default function UserTag({ name }: UserTagProps) {
  return (
    <div className="user-tag">
      <AccountBoxIcon fontSize="small" className="user-tag-icon" />
      <span>{name}!</span>
    </div>
  );
}
