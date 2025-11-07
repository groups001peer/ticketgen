export default function AvatarBalance({ name="Amandamcoy", balance=0 }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 shadow-inner" />
      <a href="#" className="mt-2 text-blue-600 text-sm">{name}</a>
      <div className="text-xs mt-1">
        Balance: <span className="text-orange-500 font-semibold">{balance.toFixed(2)} {" "} Pts</span>
      </div>
    </div>
  );
}
