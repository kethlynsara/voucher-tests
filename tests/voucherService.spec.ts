import voucherRepository from "repositories/voucherRepository";
import voucherService from "services/voucherService";


describe("Voucher Service tests suite", () => {
    it("should create a voucher", async () => {
        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any =>  {});
        jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce((code, discount) : any => {return {code, discount}});
        
        const code = "mdpe9ejw030w3w9owp";
        const discount = 20;
        await voucherService.createVoucher(code, discount);
        expect(voucherRepository.createVoucher).toBeCalled;
    });

    it("duplicated voucher, should not create another one", async () => {
        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => true);
        
        const code = "mdpe9ejw030w3w9owp";
        const discount = 20;
        expect(async () => {
            await voucherService.createVoucher(code, discount);
        }).rejects.toEqual({
            message: "Voucher already exist.",
            type: "conflict"
        });
    });

    it("should apply a voucher", async () => {
        const voucher = {
            code: "mdpe9ejw030w3w9owp",
            used: false,
            discount: 30
        }
        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => voucher);
        jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce((): any => {});
        const amount = 101;
        const result = await voucherService.applyVoucher("mdpe9ejw030w3w9owp", amount);
        expect(result.amount).toBe(amount);
        expect(result.discount).toBe(voucher.discount);
        expect(result.finalAmount).toBe(amount - (amount * (voucher.discount / 100)));
        expect(result.applied).toBe(true);
    });

    it("should not apply an used voucher", async () => {
        const voucher = {
            code: "mdpe9ejw030w3w9owp",
            used: true,
            discount: 30
        }
        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => voucher);
        const amount = 101;
        const result = await voucherService.applyVoucher("mdpe9ejw030w3w9owp", amount);
        expect(result.applied).toBe(false);
    });

    it("should not apply a voucher, amount < 100", async () => {
        const voucher = {
            code: "mdpe9ejw030w3w9owp",
            used: true,
            discount: 30
        }
        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => voucher);
        const amount = 99;
        const result = await voucherService.applyVoucher("mdpe9ejw030w3w9owp", amount);
        expect(result.applied).toBe(false);
    });
});