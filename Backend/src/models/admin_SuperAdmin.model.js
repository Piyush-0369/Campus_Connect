import {User} from "./baseUser.model.js"
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  permissions: {
    manage_users: { 
        type: Boolean, 
        default: true 
    },
    send_emails: { 
        type: Boolean, 
        default: true 
    },
    manage_events: { 
        type: Boolean, 
        default: true 
    },
    manage_donations: { 
        type: Boolean, 
        default: true 
    },
    view_audit_logs: { 
        type: Boolean, 
        default: true 
    },
  },
});

const Admin = User.discriminator("Admin", AdminSchema);


const SuperAdminSchema = new mongoose.Schema({
  permissions: {
    manage_users: { 
        type: Boolean, 
        default: true 
        
    },
    send_emails: { 
        type: Boolean, 
        default: true 
        
    },
    manage_events: { 
        type: Boolean, 
        default: true 
        
    },
    manage_donations: { 
        type: Boolean, 
        default: true 
        
    },
    view_audit_logs: { 
        type: Boolean, 
        default: true 
        
    },
    manage_admins: { 
        type: Boolean, 
        default: true 
        
    }, // super power
  },
});

const SuperAdmin = User.discriminator("SuperAdmin", SuperAdminSchema);

export {
    Admin,
    SuperAdmin
}