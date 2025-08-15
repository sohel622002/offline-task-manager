import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSocket } from "@/hooks/useSocket";
import { Download, FileCog, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { SOCKET_EVENTS } from "../../../shared";

type ProcessCard = {
  id: number;
  type: "download" | "initialize";
  title: string;
  icon: JSX.Element;
  desc: string;
};

export default function SetupProcess() {
  const [postgresBinariesDownloading, setPostgresBinariesDownloading] =
    useState<number>(0);
  const processCards: ProcessCard[] = [
    {
      id: 1,
      type: "download",
      title: "Download database binaries",
      icon: <Download />,
      desc: "We’re fetching the Postgres binaries for your local machine",
    },
    {
      id: 2,
      type: "initialize",
      title: "Initialize database",
      icon: <FileCog />,
      desc: "Setting up the Postgres binaries on your local machine",
    },
  ];

  const { on, off } = useSocket();

  const [downloadingPostgresBinaries, setDownloadingPostgresBinaries] =
    useState(true);
  const [initializingPostgresBinaries, setInitializingPostgresBinaries] =
    useState(false);

  useEffect(() => {
    on(SOCKET_EVENTS.POSTGRES_BINARY_PROGRESS, (data) => {
      console.log("data", data);
      setPostgresBinariesDownloading(data.percent);
    });

    return () => {
      off(SOCKET_EVENTS.POSTGRES_BINARY_PROGRESS);
    };
  }, [on, off]);

  return (
    <section className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="text-3xl text-center font-bold text-primary mb-1">
          Setup Database Locally
        </h1>
        <p className="text text-center text-primary mb-5">
          We’ll go through the following steps to set up the database on your
          local machine
        </p>
        <div className="space-y-3">
          {processCards.map((card) => (
            <SetupCard
              key={card.id}
              card={card}
              postgresBinariesDownloading={postgresBinariesDownloading}
              downloadingPostgresBinaries={downloadingPostgresBinaries}
              initializingPostgresBinaries={initializingPostgresBinaries}
            />
          ))}
        </div>
        <Button className="w-full mt-4 cursor-pointer">Start Setup</Button>
        <p className="text-xs text-center font-semibold text-primary mt-4">
          Make sure you’re connected to a stable internet connection and keep
          your computer powered on during this process. <br /> Thanks for
          hanging in there — we’ll be done soon!
        </p>
      </div>
    </section>
  );
}

type SetUpCardProps = {
  card: ProcessCard;
  postgresBinariesDownloading: number;
  downloadingPostgresBinaries: boolean;
  initializingPostgresBinaries: boolean;
};

function SetupCard(props: SetUpCardProps) {
  const { card, downloadingPostgresBinaries, initializingPostgresBinaries } =
    props;
  return (
    <div className="border border-border p-4 rounded-md w-full">
      <div className="flex items-center gap-2 text-primary text-lg font-semibold">
        {card.icon}
        {card.title}
      </div>
      <p className="mt-3 text-sm text-primary font-medium">{card.desc}</p>
      {/* Downloading Progress */}
      {downloadingPostgresBinaries && card.type === "download" && (
        <div className="space-y-2 mt-3">
          <div className="flex items-center justify-between text-primary">
            <span className="text-sm font-medium">
              Downloading... ({props.postgresBinariesDownloading}%)
            </span>
            {/* <Spinner size={20} primaryColor="fill-primary" /> */}
            {props.postgresBinariesDownloading > 0 &&
              props.postgresBinariesDownloading < 100 && (
                <Loader2Icon className="animate-spin" />
              )}
          </div>
          <Progress value={props.postgresBinariesDownloading} />
        </div>
      )}
      {/* Initializing Progress */}
      {initializingPostgresBinaries && card.type === "initialize" && (
        <div className="space-y-2 mt-3">
          <div className="flex items-center justify-between text-primary">
            <span className="text-sm font-medium">
              Initializing... (This may take a few minutes)
            </span>
            {/* <Spinner size={20} primaryColor="fill-primary" /> */}
            <Loader2Icon className="animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}
