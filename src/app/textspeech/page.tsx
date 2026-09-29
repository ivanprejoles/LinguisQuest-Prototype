import { ReactSpeechButton } from "@/components/global/admin/foundation/ReactSpeechSpeaker";

export default function LessonsPage() {
  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      {/* Spanish Phrase */}
      <div className="flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-2xl">
        <div>
          <p className="font-bold text-slate-800">¡Hola, ¿cómo estás?</p>
          <span className="text-xs text-slate-400 font-medium">Spanish</span>
        </div>
        <ReactSpeechButton text="¡Hola, ¿cómo estás?" voiceLanguage="es-ES" variant="primary" />
      </div>

      {/* French Phrase */}
      <div className="flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-2xl">
        <div>
          <p className="font-bold text-slate-800">Bonjour, comment ça va?</p>
          <span className="text-xs text-slate-400 font-medium">French</span>
        </div>
        <ReactSpeechButton text="Bonjour, comment ça va?" voiceLanguage="fr-FR" variant="outline" showLabel />
      </div>

      {/* Tagalog Phrase */}
      <div className="flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-2xl">
        <div>
          <p className="font-bold text-slate-800">Kumusta ka na?</p>
          <span className="text-xs text-slate-400 font-medium">Tagalog</span>
        </div>
        <ReactSpeechButton text="Kumusta ka na?" voiceLanguage="tl-PH" variant="ghost" />
      </div>
    </div>
  );
}