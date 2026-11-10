/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DuyLamReply {
  text: string;
  readDelay: number;      // Thời gian chờ ban đầu trước khi bắt đầu gõ (mô phỏng xem tin nhắn)
  typingDuration: number; // Thời gian hiển thị trạng thái đang gõ phù hợp với độ dài tin nhắn
  reaction?: string;
}

/**
 * Tính toán thời gian đọc và thời gian gõ phím phù hợp thực tế của một người bạn trai
 */
function createReply(text: string, reaction?: string): DuyLamReply {
  // 1. Độ trễ đọc tin nhắn (1.5s - 2.2s)
  const readDelay = Math.floor(Math.random() * 700) + 1500;

  // 2. Thời gian gõ phím dựa trên độ dài nội dung (tốc độ gõ tự nhiên kèm khoảng ngắt câu)
  const charCount = text.length;
  let typingDuration = Math.round(charCount * 36) + 2200;
  if (typingDuration < 3200) typingDuration = 3200; // Tối thiểu ~3.2 giây cho tin ngắn
  if (typingDuration > 8000) typingDuration = 8000; // Tối đa ~8 giây cho tin dài dặn dò

  return {
    text,
    readDelay,
    typingDuration,
    reaction,
  };
}

/**
 * Chuẩn hoá tiếng Việt không dấu để so khớp từ khoá linh hoạt
 */
function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Trình phản hồi thông minh mang phong cách bạn trai Duy Lâm
 * Tuân thủ tuyệt đối quy tắc của người dùng và các hình ảnh tin nhắn tham chiếu.
 */
export function getDuyLamResponse(userMessage: string): DuyLamReply {
  const raw = userMessage.trim();
  const normalized = removeDiacritics(raw);

  // 1. Khi bạn gái gọi tên / bắt chuyện ("Anh", "Anh ơi", "A ơi", "Lâm ơi", "Anh đâu rồi"...)
  if (
    /^(anh|anh oi|a oi|lam oi|duy lam oi|anh yeu|anh dau roi|anh a|anh ha)([\.!?\s]*)$/i.test(normalized) ||
    /^(anh oi|a oi|lam oi)/i.test(normalized)
  ) {
    const directCallingReplies = [
      'Dạ. Anh đây ạ.',
      'Dạ anh nghe ạ. Em sao thế bấy bì?',
      'Dạ. Anh đây nè, em bé gọi anh có chuyện gì thế ạ? 🐶',
      'Dạ anh nghe em ơi. Có chuyện gì kể anh nghe nào.',
    ];
    const chosen = directCallingReplies[Math.floor(Math.random() * directCallingReplies.length)];
    return createReply(chosen, '❤️');
  }

  // 2. Khi bạn gái trách móc, chửi, dỗi hoặc giận hờn ("trách", "chửi", "lươn lẹo", "đáng ghét", "dẹp", "hận", "cút", "ghét", "ai bảo", "tại anh"...)
  if (
    /trach|chui|luon leo|dang ghet|dep di|nghi di|han anh|cut|ghet anh|ai bao|tai anh|anh lam sao|sao anh|do dang ghet|buc minh|kho chiu|doi roi|gian anh|xao|gian roi/i.test(
      normalized
    )
  ) {
    const scoldReplies = [
      'A ngoan mà. K được suy diễn hướng này nha 🥺',
      'A ngoan mà. Bấy bì đừng mắng anh tội nghiệp mà, anh thương em nhất mà!',
      'A ngoan mà, anh đâu dám cãi bấy bì đâu ạ. Có gì cứ nói rõ anh ok sẽ có cách xử lý hợp lý cho em ạ ❤️',
      'Nào nào. A ngoan mà! Ngoan đi nào, anh xót em lắm đừng giận anh nữa nha 🐶🥺',
      'A ngoan mà. Đừng mắng a mà, tối anh mua đồ ngon qua đền bù cho công chúa chịu không?',
    ];
    const chosen = scoldReplies[Math.floor(Math.random() * scoldReplies.length)];
    return createReply(chosen, '🥺');
  }

  // 3. Quy trình chăm sóc chu đáo khi đau đầu ("Em đau đầu", "nhức đầu", "nhức óc", "đầu em đau", "bị nhức đầu"...)
  if (/dau dau|nhuc dau|nhuc oc|dau nua dau|buot dau/i.test(normalized)) {
    const headacheProtocol =
      'Dạ. Em đau đầu nhiều không ạ? Nghe anh dặn kỹ các bước này nhé:\n\n' +
      '1. Uống ngay một cốc nước ấm hoặc trà gừng ấm giúp lưu thông máu.\n' +
      '2. Bỏ điện thoại xuống, kéo rèm và tắt đèn để phòng thật yên tĩnh, mát mẻ.\n' +
      '3. Lấy khăn ấm hoặc khăn mát chườm nhẹ lên trán và vùng sau gáy, kết hợp day nhẹ hai bên thái dương.\n' +
      '4. Nếu đói thì nhớ ăn lót dạ nhẹ một xíu rồi hãy uống 1 viên Paracetamol 500mg nếu còn buốt đầu nhé.\n\n' +
      'Ngoan nằm nghỉ ngơi xíu đi em, thấy em mệt là anh lo và xót lắm đấy ạ 🥺❤️';
    return createReply(headacheProtocol, '🥺');
  }

  // 4. Khi đau tay, chấn thương, trầy xước ("Em đau tay", "đau chân", "mèo cào", "té", "ngã", "đứt tay", "bầm"...)
  if (/dau tay|dau chan|dut tay|meo cao|te|nga|bam tim|tray xuoc|vet thuong|bi thuong/i.test(normalized)) {
    const hurtProtocol =
      'Hả? Đau tay thế nào, đâu anh xem nào? Em bị va quẹt vào đâu hay sao vậy ạ?\n\n' +
      'Em nhớ rửa sạch bằng nước muối sinh lý hoặc sát khuẩn cẩn thận rồi băng gạc lại liền nha. Có đau nhiều không em? Đừng làm việc nặng hay động nước nhiều nữa nhé. Ngoan nghỉ tay xíu đi, anh xót quá nè 🥺';
    return createReply(hurtProtocol, '🥺');
  }

  // 5. Khi mất ngủ, không ngủ được ("Em không ngủ được", "khó ngủ", "mất ngủ", "thức khuya", "dậy sớm", "ngủ không ngon"...)
  if (/khong ngu duoc|kho ngu|mat ngu|thuc khuya|chua ngu|khong ngu noi|ngu ko ngon|ngu khong ngon|tinh giac/i.test(normalized)) {
    const sleepCare =
      'Dạ. Sao hôm nay em khó ngủ vậy ạ? Em bỏ điện thoại ra xa một chút, nhắm mắt lại rồi hít thở sâu, chậm rãi nè.\n\n' +
      'Anh đang bật bài "Phép Màu" (Chạm Music Box) cho em nghe nè, nghe giai điệu cho thư thái tâm hồn nhé. Cố gắng ngủ sớm, mai sáng dậy đi dạo thể dục với anh cho khoẻ khoắn nha bấy bì! 🐶🌙';
    return createReply(sleepCare, '🌙');
  }

  // 6. Nhắc nhở ăn uống khi đói hoặc bỏ bữa ("Em đói", "chưa ăn gì", "bỏ bữa", "nhịn đói", "ăn trưa", "ăn tối", "ăn sáng"...)
  if (/doi|chua an|bo bua|nhin doi|an gi|an trua|an toi|an sang|chua an com|them an/i.test(normalized)) {
    const foodCare =
      'Không được nhịn đói hay bỏ bữa đâu đấy nhé! Trước chưa có anh thì sao cũng được, chứ giờ có anh rồi là phải ăn uống đầy đủ nghe chưa.\n\n' +
      'Em muốn ăn gì kể anh nghe để anh đặt hoặc mang qua cho em liền nè? Ăn cho hết đó nhé, bấy bì của anh phải giữ sức khoẻ thật tốt đấy! 🍿🥣';
    return createReply(foodCare, '🥣');
  }

  // 7. Nhắc giữ gìn sức khoẻ khi mệt, sốt, cảm cúm ("bị ốm", "sốt", "mệt", "đau bụng", "cảm cúm", "viêm họng", "ho"...)
  if (/om|sot|met|dau bung|cam cum|viem hong|ho|so mui|duoi suc/i.test(normalized)) {
    const sickCare =
      'Dạ. Em thấy người mệt thế nào ạ? Đo nhiệt độ thử xem có bị sốt không em? Nhớ mặc đủ ấm, uống nhiều nước ấm và nghỉ ngơi sớm đi nhé.\n\n' +
      'Cố gắng giữ tinh thần tốt em nhé, đừng để bị quá tải công việc. Em mà bệnh là anh ở xa sốt ruột không yên tâm làm việc được đâu á 🥺❤️';
    return createReply(sickCare, '🥺');
  }

  // 8. Bày tỏ tình cảm, nỗi nhớ, muốn gặp ("Em nhớ anh", "nhớ anh", "muốn gặp anh"...)
  if (/em nho anh|e nho anh|em nho a|e nho a|nho anh|nho a|muon gap anh|muon gap a/i.test(normalized)) {
    return createReply('anh cũng đang nhớ e nè, tối mình gặp nhau e nhé <3', '❤️');
  }

  if (/yeu anh|thuong anh|iu anh|yeu a|thuong a/i.test(normalized)) {
    const loveReplies = [
      'Bản thân anh chủ động nhớ em chứ không phải vì em nhớ anh mà anh cũng nhớ em đâu á 🐶❤️',
      'Yêu em nhiều lắm! Nhìn bức ảnh hai đứa mình nắm tay ở CGV Hoàng Văn Thụ là anh chỉ muốn chạy qua ôm em ngay thôi 🥰',
      'Ai bằng mắt của anh chứ! Anh thương em nhất trên đời, ráng giữ gìn sức khoẻ thật tốt để cuối tuần anh qua đón đi hẹn hò tiếp nha ✨',
    ];
    const chosen = loveReplies[Math.floor(Math.random() * loveReplies.length)];
    return createReply(chosen, '💖');
  }

  // 9. Khen ảnh, hỏi sắc đẹp ("Xinh không", "Em đẹp không", "Thấy em thế nào"...)
  if (/xinh ko|xinh khong|dep ko|dep khong|xinh chua|co xinh|xem anh|nhin em/i.test(normalized)) {
    const beautyReply =
      'Không... Thể nói là không xinh được ạ! Em cứ ở đó mà đẹp vậy đi, anh nhìn mê không dứt ra nổi đây nè. Bấy bì của anh lúc nào cũng là xinh nhất trần đời rồi 🥰✨';
    return createReply(beautyReply, '🥰');
  }

  // 10. Đi chơi, hẹn hò, CGV Hoàng Văn Thụ, bắp Tom Yum
  if (/cgv|hoang van thu|xem phim|rap phim|bap tom yum|hen ho|di choi|di dao/i.test(normalized)) {
    const dateReply =
      'Dạ. Nhớ hôm 08/11 hai đứa mình ở CGV Hoàng Văn Thụ ghê, bắp Tom Yum ngon với được nắm chặt bàn tay nhỏ nhắn của em ấm áp thật sự! Cuối tuần này em muốn đi đâu, nói anh trước để anh sắp xếp qua đón công chúa liền nha 🎬🍿';
    return createReply(dateReply, '🍿');
  }

  // 11. Hỏi anh đang ở đâu, đang làm gì ("Anh đang làm gì", "Anh về chưa", "Anh ở đâu"...)
  if (/dang lam gi|ve chua|o dau|ve dong nai|ve nha chua|dang lam j/i.test(normalized)) {
    const statusReply =
      'Dạ. Anh về rồi ạ. Đang vừa ngồi làm việc vừa nghe bài "Phép Màu", thỉnh thoảng mở ảnh hai đứa mình ra ngắm cho có thêm động lực nè. Bấy bì của anh hôm nay thế nào rồi v ạ?';
    return createReply(statusReply, '🐶');
  }

  // 12. Các câu dặn dò giữ gìn sức khoẻ và yêu thương chuẩn giọng điệu Duy Lâm
  const fallbackReplies = [
    'Dạ. Anh nghe em nói nè. Cố gắng giữ tinh thần tốt em nhé, có gì áp lực cứ chia sẻ với anh, anh luôn ở đây với em mà 🐶❤️',
    'Dạ anh đây ạ. Nhớ ăn uống đầy đủ với uống nhiều nước vào nha em, đừng để anh phải lo đấy nhé bấy bì!',
    'Đã lưu ý ạ! Bấy bì dặn là anh ghi nhớ liền nè. Tối nay nhớ ngủ sớm nha, không được thức bấm điện thoại muộn đâu đấy!',
    'Anh đồng ý ạ! Lúc nào cũng yêu thương và chiều chuộng em nhất. Giữ sức khoẻ thật tốt để cuối tuần mình đi hẹn hò nhé ✨',
    'Dạ. Em ở đó ngoan nhé, xong việc anh nhắn tin hoặc gọi video cho em liền nha. Thương em nhiều lắm!',
  ];
  const chosen = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
  return createReply(chosen, '💕');
}
