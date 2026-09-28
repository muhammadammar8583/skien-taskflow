const AppRoutes = {
    pages: {
        dashboard: "/",
        board: "/board",
        login: "/login",
        register: "/register",
        forgotPassword: "/forgot-password",
        resetPassword: "/reset-password",
    },
    links: {
        terms: "/terms",
        privacy: "/privacy",
    },
    api: {
        auth: {
            login: "/api/auth/login",
            register: "/api/auth/register",
            forgotPassword: "/api/auth/forgot-password",
            resetPassword: "/api/auth/reset-password",
            changePassword: "/api/auth/change-password",
        },
    },
    legacyWorkspace: {
        projects: "/projects",
        kanbanBoard: "/kanban-board",
        members: "/members",
        settings: "/settings",
        profile: "/profile",
        accountSettings: "/account-settings",
    },
}

export default AppRoutes;