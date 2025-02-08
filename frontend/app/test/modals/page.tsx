"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormModal from "@/components/ui/custom/form-modal/add-company/add-company";
import type {
  Transactions,
  SubAccountFormData,
} from "@/components/ui/custom/form-modal/account.config";
import { companyFormConfig } from "@/components/ui/custom/form-modal/add-company/add-company.config";

// Dynamic Imports
const AccountDetailModal = dynamic(() =>
  import("@/components/ui/custom/form-modal/account-detail/account-detail").then(
    (mod) => mod.AccountDetailModal
  )
);

const AccountForm = dynamic(() =>
  import("@/components/ui/custom/form-modal/account-form/account-form").then(
    (mod) => mod.AccountForm
  )
);

const SubAccountForm = dynamic(() =>
  import(
    "@/components/ui/custom/form-modal/account-form/sub-account-form"
  ).then((mod) => mod.SubAccountForm)
);

const AddAccountForm = dynamic(() =>
  import("@/components/ui/custom/form-modal/add-account/add-account").then(
    (mod) => mod.AddAccountForm
  )
);



const ModalsPage = () => {
  const [openStates, setOpenStates] = useState({
    detail: false,
    account: false,
    subAccount: false,
    addAccount: false,
    company: false,
    accountManager: false,
  });

  const parentAccount = {
    namaAkun: "Kas Besar",
    kodeAkun: "11112",
    debit: "1000000",
    kredit: "0",
  };

  const toggleModal = (modal: keyof typeof openStates, isOpen: boolean) => {
    setOpenStates((prev) => ({ ...prev, [modal]: isOpen }));
  };

  const handleSubmit =
    (type: string) =>
    (data: Transactions[] | Transactions | SubAccountFormData | Record<string, unknown>) => {
      console.log(`${type} submitted:`, data);
      toggleModal(type as keyof typeof openStates, false);
    };

  return (
    <div className="p-6 space-y-6">
      {/* 1. Company Form Modal */}
      <div>
        <h2 className="text-lg mb-3">1. Company Form Modal</h2>
        <FormModal
          triggerText="Tambah Perusahaan"
          title="Form Perusahaan"
          formFields={companyFormConfig.fields}
          buttons={companyFormConfig.buttons}
          onOpenChange={(o) => toggleModal("company", o)}
        />
      </div>

      {/* 2. Account Detail Modal */}
      <div>
        <h2 className="text-lg mb-3">2. Account Detail Modal</h2>
        <Button onClick={() => toggleModal("detail", true)}>Open Account Detail</Button>
        <AccountDetailModal
          isOpen={openStates.detail}
          onClose={() => toggleModal("detail", false)}
          onSave={handleSubmit("detail")}
        />
      </div>

      {/* 3. Add Account Form Modal */}
      <div>
        <h2 className="text-lg mb-3">5. Add Account Form</h2>
        <Button onClick={() => toggleModal("addAccount", true)}>Open Add Account Form</Button>
        <Dialog open={openStates.addAccount} onOpenChange={(o) => toggleModal("addAccount", o)}>
          <DialogContent className="sm:max-w-[600px] p-6 rounded-xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-primary">Add Account</DialogTitle>
            </DialogHeader>
            <AddAccountForm
              onClose={() => toggleModal("addAccount", false)}
              onSubmit={handleSubmit("addAccount")}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 4. Account Form Modal */}
      <div>
        <h2 className="text-lg mb-3">3. Account Form</h2>
        <Button onClick={() => toggleModal("account", true)}>Open Account Form</Button>
        <Dialog open={openStates.account} onOpenChange={(o) => toggleModal("account", o)}>
          <DialogContent className="sm:max-w-[500px] p-6 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Form Account</DialogTitle>
            </DialogHeader>
            <AccountForm onSubmit={handleSubmit("account")} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 5. Sub Account Form Modal */}
      <div>
        <h2 className="text-lg mb-3">4. Sub Account Form</h2>
        <Button onClick={() => toggleModal("subAccount", true)}>Open Sub Account Form</Button>
        <Dialog open={openStates.subAccount} onOpenChange={(o) => toggleModal("subAccount", o)}>
          <DialogContent className="sm:max-w-[500px] p-6 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Form Sub Account</DialogTitle>
            </DialogHeader>
            <SubAccountForm
              parentAccount={parentAccount}
              onSubmit={handleSubmit("subAccount")}
              onDelete={() => console.log("Sub account deleted")}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ModalsPage;
