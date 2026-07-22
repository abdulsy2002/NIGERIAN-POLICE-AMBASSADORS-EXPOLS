import { Request, Response } from 'express';
import { MongoPaymentRepository } from '../../infrastructure/repositories/MongoPaymentRepository';
import { Payment } from '../../core/domain/entities/Payment';

const paymentRepo = new MongoPaymentRepository();

export class PaymentController {
  async initializePayment(req: Request, res: Response) {
    const { expolIdNumber, fullName, email, phone, purpose, amount, notes, customReason } = req.body;
    const reference = `T${Date.now()}`;

    if (!expolIdNumber || !fullName || !email || !amount || !purpose) {
      return res.status(400).json({ success: false, error: 'Missing required payment details' });
    }

    try {
      const payment: Payment = {
        expolIdNumber,
        fullName,
        email,
        phone,
        purpose,
        amount,
        customReason: purpose === 'other' ? customReason : null,
        paystackReference: reference,
        status: 'pending',
        notes,
      };

      const saved = await paymentRepo.create(payment);

      return res.status(200).json({
        success: true,
        data: {
          reference: saved.paystackReference,
          amount: saved.amount * 100, // in kobo for Paystack
          email: saved.email,
          fullName: saved.fullName,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async verifyPayment(req: Request, res: Response) {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ success: false, error: 'Missing reference' });
    }

    try {
      const payment = await paymentRepo.findByReference(reference);
      if (!payment) {
        return res.status(404).json({ success: false, error: 'Payment not found' });
      }

      // Update status to success (in prod, query Paystack API first)
      await paymentRepo.updateByReference(reference, { status: 'success' });

      return res.status(200).json({ success: true, message: 'Payment verified successfully!' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
