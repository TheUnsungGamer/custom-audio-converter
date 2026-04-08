import React, { useState, useEffect, useMemo, useRef } from "react";

const FRAME_URL = "/frame.png";

function randomHex(length = 8) {
  const chars = "ABCDEF0123456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default function Mp4ToWavConverterUI() {
  const [fileName, setFileName] = useState("");
  const [outputName, setOutputName] = useState("converted.wav");
  const [progress, setProgress] = useState(0);
  const [statusLines, setStatusLines] = useState([
    "ADMINISTRATUM V999.M41",
    "++ PRAISE THE OMNISSIAH ++",
    "",
    "> GREPBOT -M 1 -A 5 ^AUDIO_TRANSMUTATION_NODE.TXT",
    "AUDIO CONVERSION RECORD",
    "- INPUT SOURCE(S)------0",
    "- OUTPUT FILE(S)------0",
    "- PROCESS STATE-------IDLE",
    "",
    "> WHINE /MNT/A/COMMANDS.EXE",
    "> AWAITING COMMAND",
  ]);
  const [isConverting, setIsConverting] = useState(false);
  const [cursor, setCursor] = useState(true);
  const [flicker, setFlicker] = useState(false);
  const terminalRef = useRef(null);

  const hasElectronAPI =
    typeof window !== "undefined" && typeof window.electronAPI !== "undefined";

  useEffect(() => {
    const t = setInterval(() => setCursor((c) => !c), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setFlicker(Math.random() > 0.72);
    }, 120);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [statusLines]);

  const terminalStyle = useMemo(
    () => ({
      textShadow: flicker
        ? "0 0 5px rgba(0,255,120,0.8), 0 0 10px rgba(0,255,120,0.35), 1px 0 0 rgba(0,255,180,0.12)"
        : "0 0 4px rgba(0,255,120,0.55), 0 0 8px rgba(0,255,120,0.18)",
      transform: flicker ? "translateX(0.35px)" : "translateX(0px)",
      filter: flicker ? "brightness(1.08)" : "brightness(1)",
    }),
    [flicker]
  );

  const pushLine = (line) => {
    setStatusLines((prev) => [...prev, line]);
  };

  const pushUniqueLine = (line) => {
    setStatusLines((prev) => {
      if (prev[prev.length - 1] === line) return prev;
      return [...prev, line];
    });
  };

  const pushBlock = (lines) => {
    setStatusLines((prev) => [...prev, ...lines]);
  };

  const handlePickFile = async () => {
    if (!hasElectronAPI) {
      pushLine("ERROR: ELECTRON API NOT AVAILABLE");
      return;
    }

    const pickedPath = await window.electronAPI.pickMp4();
    if (!pickedPath) {
      pushLine("FILE PICK CANCELLED");
      return;
    }

    setFileName(pickedPath);
    const base = pickedPath.replace(/\.mp4$/i, "");
    setOutputName(`${base}.wav`);

    pushBlock([
      "",
      `> LOCATE /MNT/VID/${randomHex(6)}.MP4`,
      `> FILE LOADED: ${pickedPath}`,
      `> DESIGNATED OUTPUT: ${base}.wav`,
      "- INPUT SOURCE(S)------1",
      "- OUTPUT FILE(S)------1",
      "- PROCESS STATE-------READY",
    ]);
  };

  useEffect(() => {
    if (!hasElectronAPI || !window.electronAPI.onConvertProgress) return undefined;

    const unsubscribe = window.electronAPI.onConvertProgress((payload) => {
      if (!payload) return;

      if (typeof payload.percent === "number") {
        setProgress(Math.max(0, Math.min(100, Math.round(payload.percent))));
      }

      if (payload.line) {
        pushUniqueLine(`> ${payload.line}`);
      }

      if (payload.stage) {
        pushUniqueLine(`- PROCESS STAGE-------${payload.stage.toUpperCase()}`);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [hasElectronAPI]);

  const handleConvert = async () => {
    if (!fileName) {
      pushLine("ERROR: NO FILE");
      return;
    }

    if (!hasElectronAPI) {
      pushLine("ERROR: ELECTRON API NOT AVAILABLE");
      return;
    }

    setIsConverting(true);
    setProgress(0);

    pushBlock([
      "",
      "> INITIATING AUDIO EXTRACTION",
      "> MOUNTING MP4 CONTAINER",
      "- PROCESS STATE-------ACTIVE",
    ]);

    const result = await window.electronAPI.convertMp4ToWav({
      inputPath: fileName,
      outputPath: outputName,
    });

    if (result?.ok) {
      setProgress(100);
      pushBlock([
        `> OUTPUT WRITTEN: ${outputName}`,
        "> ARCHIVE SEALED",
        "- PROCESS STATE-------COMPLETE",
        "++ OPERATION COMPLETE ++",
      ]);
    } else {
      setProgress(0);
      pushBlock([
        `ERROR: ${result?.stderr || "CONVERSION FAILED"}`,
        "- PROCESS STATE-------FAULT",
      ]);
    }

    setIsConverting(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-6xl"
        style={{
          backgroundImage: `url(${FRAME_URL})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          padding: "32px",
        }}
      >
        <div className="relative bg-[#020603] border border-[#0f3] p-4 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-[0.16] bg-[repeating-linear-gradient(to_bottom,rgba(0,255,100,0.11)_0px,rgba(0,255,100,0.11)_1px,transparent_2px,transparent_4px)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,120,0.18),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-y-0 left-[6%] w-[1px] bg-[#00ff66]/20" />
          <div className="pointer-events-none absolute inset-y-0 right-[5%] w-[1px] bg-[#00ff66]/10" />

          <div
            ref={terminalRef}
            className="relative h-[520px] overflow-y-auto pr-2 font-mono text-[#00ff66] text-[13px] leading-6 space-y-1"
            style={terminalStyle}
          >
            {statusLines.map((line, i) => {
              const unstable = line.includes("ERROR") || line.includes("FAULT");
              const dim = line.startsWith("-") || line.startsWith("++");
              const command = line.startsWith(">");

              return (
                <div
                  key={`${line}-${i}`}
                  className={[
                    unstable ? "text-[#9dff9d]" : "",
                    dim ? "opacity-90" : "",
                    command ? "pl-1" : "",
                    flicker && i % 7 === 0 ? "translate-x-[0.3px]" : "",
                  ].join(" ")}
                >
                  {line}
                </div>
              );
            })}

            <div>{cursor ? "_" : ""}</div>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-3 border-t border-[#0f3]/40 pt-4">
            <button
              type="button"
              onClick={handlePickFile}
              className="bg-[#d4d4d4] text-black px-5 py-2 font-mono text-sm tracking-[0.18em] border border-white/40 hover:bg-white"
            >
              LOAD FILE
            </button>

            <button
              type="button"
              onClick={handleConvert}
              disabled={isConverting}
              className="bg-[#d4d4d4] text-black px-5 py-2 font-mono text-sm tracking-[0.18em] border border-white/40 hover:bg-white disabled:opacity-50"
            >
              {isConverting ? "PROCESSING" : "EXECUTE"}
            </button>

            <div className="ml-auto self-center font-mono text-[#00ff66] text-xs opacity-70 tracking-[0.18em]">
              <span className="flex items-center gap-2">
              <img src="/yandb.png" alt="logo" className="h-6 opacity-80" />
              <span>DEVELOPMENT</span>
            </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
