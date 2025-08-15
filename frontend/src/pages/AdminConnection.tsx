import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2Icon, Monitor, RefreshCcw } from "lucide-react";

export default function AdminConnection() {
  return (
    <section className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl text-center font-bold text-primary mb-1">
          Find Your Admin
        </h1>
        <p className="text text-center text-primary mb-5">
          Scan your network to connect to your team's admin
        </p>

        <Card className="border border-border text-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl">Detected Admin PCs</span>
              <RefreshCcw size={20} className="cursor-pointer" />
            </CardTitle>
            <CardDescription>
              Ensure to connect to same network as your team admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-border p-3 rounded flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <Monitor />
                  <span className="flex flex-col">
                    <span className="font-semibold">Admin PC-1</span>
                    <span className="text-xs font-semibold">192.168.1.1</span>
                  </span>
                </div>
                <Button className="font-medium">Connect</Button>
              </div>
              <div className="border border-border p-3 rounded flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <Monitor />
                  <span className="flex flex-col">
                    <span className="font-semibold">Admin PC-1</span>
                    <span className="text-xs font-semibold">192.168.1.1</span>
                  </span>
                </div>
                <Button className="font-medium">
                    {/* <Loader2Icon className="animate-spin" /> */}
                    Connect</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* <Button className="w-full mt-4 cursor-pointer">Scan Network</Button> */}
      </div>
    </section>
  );
}
