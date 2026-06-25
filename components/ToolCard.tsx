import { AiTool } from '@/lib/types';

interface ToolCardProps {
  tool: { id: AiTool; name: string; desc: string };
  active: boolean;
  onClick: () => void;
}

export default function ToolCard({ tool, active, onClick }: ToolCardProps) {
  return (
    <div className={`tc${active ? ' active' : ''}`} onClick={onClick}>
      <div className="tn">{tool.name}</div>
      <div className="td">{tool.desc}</div>
    </div>
  );
}
