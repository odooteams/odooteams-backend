import React from 'react';
import QuoteRequestDialog from './QuoteRequestDialog';

interface ProjectContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  projectCost?: string;
  onSendToWhatsApp?: (formData: any) => void; // ignored — submissions go to backend
}

const ProjectContactDialog: React.FC<ProjectContactDialogProps> = (props) => (
  <QuoteRequestDialog
    open={props.open}
    onOpenChange={props.onOpenChange}
    projectTitle={props.projectTitle}
    projectCost={props.projectCost}
    variant="magenta"
  />
);

export default ProjectContactDialog;
