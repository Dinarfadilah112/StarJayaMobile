import React, { createContext, useContext, useState } from 'react';

type Role = 'Owner' | 'Mekanik' | 'Kasir';

interface UserData {
    name: string;
    role: Role;
    avatar: string;
}

interface UserContextType {
    user: UserData;
    updateName: (name: string) => void;
    updateRole: (role: Role) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserData>({
        name: 'Star Jaya',
        role: 'Owner',
        avatar: 'https://placehold.co/100x100/0EA5E9/FFFFFF/png?text=SJ',
    });

    const updateName = (name: string) => {
        setUser(prev => ({ ...prev, name }));
    };

    const updateRole = (role: Role) => {
        setUser(prev => ({ ...prev, role }));
    };

    return (
        <UserContext.Provider value={{ user, updateName, updateRole }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
