import { app, BrowserWindow } from "electron";
import { registerIpcHandlers } from "@main/ipc";
import { createMainWindow } from "@main/window";

function bootstrapApplication(): void {
    registerIpcHandlers();

    app.whenReady().then(() => {
        void createMainWindow();

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createMainWindow();
            }
        });
        
    });
    

    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });
}

bootstrapApplication();
