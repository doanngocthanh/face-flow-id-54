import React from "react";

const AppFooter = () => (
<div className="w-full text-center py-4 text-xs text-muted-foreground bg-background/80 border-t border-border/20">
    © 2025 eKYC App. Powered by System Development Department, Cathay Life Việt Nam.
    <div className="mt-2">
        <a
            href="https://www.cathaylife.com.vn/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
        >
            Visit Cathay Life Việt Nam
        </a>
    </div>
</div>
);

export default AppFooter;
