import { ChatClient } from "@/components/chat/ChatClient";
import { getUserPosition } from "@/lib/db/queries";
import { getConversationStarters } from "@/lib/data/starters";

// Force dynamic execution to query MongoDB live on every request
export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const position = await getUserPosition();
  const starters = await getConversationStarters();

  return (
    <div className="h-screen w-screen overflow-hidden bg-black flex flex-col">
      <ChatClient initialPosition={position} starters={starters} />
    </div>
  );
}
